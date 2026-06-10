import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
return (
<header
className="
sticky
top-0
z-50
h-16


    border-b
    border-white/10

    bg-white/[0.03]
    backdrop-blur-2xl

    flex
    items-center
    justify-between

    px-6
  "
>
  <div>
    <h1
      className="
        text-sm
        font-medium
        text-white/80
      "
    >
    </h1>
  </div>

  <div
    className="
      flex
      items-center
      gap-4
    "
  >
    <UserButton />
  </div>
</header>


);
}
