import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header
      className="
        h-16
        border-b
        border-zinc-800
        bg-black
        flex
        items-center
        justify-end
        px-6
      "
    >
      <UserButton />
    </header>
  );
}