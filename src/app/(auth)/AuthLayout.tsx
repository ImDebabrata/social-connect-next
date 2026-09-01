import Image, { StaticImageData } from "next/image";

export default function AuthLayout({
  image,
  children,
}: {
  image: StaticImageData;
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          {children}
        </div>
        <Image
          src={image}
          alt="Authentication illustration"
          className="hidden w-1/2 object-cover md:block"
          priority
        />
      </div>
    </main>
  );
}
