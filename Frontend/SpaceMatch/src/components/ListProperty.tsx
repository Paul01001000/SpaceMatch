import React from "react";

interface ListPropertyProps {
    setView: (view) => void;
  }

const ListProperty: React.FC<ListPropertyProps> = ({setView}) => (
    <section className="flex justify-center py-8">
        <button className="bg-red-700 text-white px-10 py-5 rounded-full hover:bg-red-800 text-2xl font-bold shadow-lg transition-all duration-200" onClick={() => setView('create')}>
            List Your Property
        </button>
    </section>
)

export default ListProperty;