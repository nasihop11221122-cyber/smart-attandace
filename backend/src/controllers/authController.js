import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { sendResetEmail } from '../utils/sendEmail.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,                    // prod me HTTPS only
  sameSite: env.isProd ? 'none' : 'lax', // frontend/backend alag domain par ho to 'none' chahiye
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};

const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

const sendToken = (res, user, status = 200) => {
  const token = jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
  res.cookie('token', token, cookieOptions);
  res.status(status).json({ user: publicUser(user) });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const superAdminExists = await User.exists({ role: 'super_admin' });
  if (superAdminExists) {
    return res.status(403).json({ message: 'Registration is closed. A super admin already exists' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'This email is already registered' });

  const hashed = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, password: hashed });
    sendToken(res, user, 201);
  } catch (err) {
    if (err.code === 11000) {
      // Agar do log ek saath register karein to database doosre ko yahan rok deta hai
      if (err.keyPattern?.role || /role_1/.test(err.message)) {
        return res.status(403).json({ message: 'Registration is closed. A super admin already exists' });
      }
      return res.status(409).json({ message: 'This email is already registered' });
    }
    throw err;
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ message: 'Invalid email or password' });

  sendToken(res, user);
};

export const logout = (req, res) => {
  const { maxAge, ...opts } = cookieOptions; // clearCookie me same options chahiye
  res.clearCookie('token', opts);
  res.json({ message: 'Logged out' });
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });

export const updateProfile = async (req, res) => {
  const { name, email, password, currentPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (name !== undefined) user.name = name;

  if (email !== undefined && email !== user.email) {
    const taken = await User.findOne({ email });
    if (taken) return res.status(409).json({ message: 'This email is already registered' });
    user.email = email;
  }

  if (password !== undefined) {
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(password, 12);
  }

  // role yahan kabhi change nahi hota
  try {
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This email is already registered' });
    throw err;
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Har soorat me same jawab, taake koi ye na jaan sake ke email registered hai ya nahi
  const generic = { message: 'If this email is registered, a reset link has been sent' };

  const user = await User.findOne({ email });
  if (!user) return res.json(generic);

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  await User.updateOne(
    { _id: user._id },
    { resetPasswordToken: hashedToken, resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000) }
  );

  try {
    await sendResetEmail({
      toEmail: user.email,
      toName: user.name,
      resetLink: `${env.clientUrls[0]}/reset-password/${token}`,
    });
  } catch (err) {
    console.error('Reset email failed:', err.message);
  }

  res.json(generic);
};

export const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

  const hashed = await bcrypt.hash(req.body.password, 12);
  await User.updateOne(
    { _id: user._id },
    { password: hashed, $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
  );

  res.json({ message: 'Password has been reset. Please log in' });
};