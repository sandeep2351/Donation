export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh min-h-screen w-full min-w-0 flex-col bg-gray-50">{children}</div>
  );
}
