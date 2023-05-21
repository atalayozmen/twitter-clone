import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex justify-center align-middle">
      <SignIn />
    </main>
  );
}
