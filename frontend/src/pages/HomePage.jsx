import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import toast from "react-hot-toast";

function HomePage() {
    return (
        <>
            <button className="btn btn-primary"
            onClick={() => toast.success("This is success toast")}
            >Click Me</button>

            <SignedOut>
                <SignInButton mode="modal"/>
            </SignedOut>
            <SignedIn>
                <SignOutButton />
            </SignedIn>
            <UserButton />
        </>
    )
}

export default HomePage