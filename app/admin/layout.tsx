export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-dvh w-full overflow-hidden bg-gray-50">{children}</div>;
}
