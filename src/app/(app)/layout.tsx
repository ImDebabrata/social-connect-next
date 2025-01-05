import Navbar from "@/components/Navbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col private-layout">
      <Navbar />
      <div className="mx-auto max-w-7xl p-5 border">{children}</div>
    </div>
  );
}
