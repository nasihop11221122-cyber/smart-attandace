export default function Navbar({ title }) {
  return (
    <header className="flex h-14 items-center border-b border-slate-200 bg-white px-5">
      <span className="font-semibold text-slate-800">{title}</span>
    </header>
  );
}