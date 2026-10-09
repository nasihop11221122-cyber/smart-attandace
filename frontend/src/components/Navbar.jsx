export default function Navbar({ title }) {
  return (
    <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:px-6">
      <span className="font-semibold text-slate-800">{title}</span>
    </header>
  );
}