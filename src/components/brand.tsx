import Link from "next/link";

export function Brand({compact=false}:{compact?:boolean}) {
  return <Link href="/" className="inline-flex items-center gap-3" aria-label="HospitIA — accueil">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-xl font-black text-[#7BDFC5] shadow-sm">H</span>
    <span className="block">
      <span className="block text-lg font-bold leading-tight tracking-tight text-ink">HospitIA</span>
      {!compact&&<span className="block text-[10px] font-medium tracking-[0.12em] text-slate-500">HOSPITALITY INTELLIGENCE</span>}
    </span>
  </Link>;
}
