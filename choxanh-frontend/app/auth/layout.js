export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[url('/bg-food.jpg')] bg-cover bg-center">
      <div className="flex justify-center items-center py-16">
        {children}
      </div>
    </div>
  );
}