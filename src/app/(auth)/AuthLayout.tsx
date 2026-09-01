import Image, { StaticImageData } from "next/image";

export default function AuthLayout({
  image,
  children,
}: {
  image: StaticImageData;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex min-h-[34rem] max-h-[46rem] w-full max-w-[64rem] overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
        <div className="flex w-full flex-col justify-center overflow-y-auto p-6 sm:p-8 md:p-10 md:w-1/2">
          {children}
        </div>
        <div className="relative hidden w-1/2 bg-muted md:block">
          <Image
            src={image}
            alt="Authentication illustration"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </main>
  );
}
