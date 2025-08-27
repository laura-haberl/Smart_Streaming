import Link from "next/link";

const Navbar: React.FC = () => {
    return (
        <nav className="bg-dark py-4 navbar-styling">
            <div className="container mx-auto">
                <div className="flex justify-between w-full">
                    <Link className="text-light text-white hover:text-gray-300" href="/">
                        Smart Streaming
                    </Link>
                    <Link className="text-light text-white hover:text-gray-300" href="/profile">
                        Profil
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
