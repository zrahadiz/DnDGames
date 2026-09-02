export default function CustomFieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="text-[10px] font-cinzel tracking-[0.08em] text-[#5a4830] uppercase">
      {children}
    </span>
  );
}
