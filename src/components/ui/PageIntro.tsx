export function PageIntro({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="mb-12 max-w-4xl">
      <h1 className="m-0 text-balance [font-family:Newsreader] text-5xl font-medium leading-[1.04] tracking-[-0.035em] text-[#0b292f] sm:text-[54px]">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#65797b]">
        {copy}
      </p>
    </div>
  );
}
