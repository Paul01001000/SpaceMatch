import React from "react";
import SearchBar from "./SearchBar";
import ListProperty from "./ListProperty";
import Marketing from "./Marketing";

interface LandingPageProps {
    setView: (view) => void;
  }

const LandingPage: React.FC<LandingPageProps>= ({setView}) => {
    return (
        <main className="bg-white text-black font-sans w-full flex-1">

            {/* Search Bar */}
            <SearchBar/>

            {/* List Your Property */}
            <ListProperty setView={setView}/>

            {/* Featured Cities */}
            <Marketing/>
        </main>
    );
}
export default LandingPage;
