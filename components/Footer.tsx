export default function Footer() {
    return (
      <footer className="bg-dark text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            {/* Bagian Kiri */}
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-bold text-accent">🐾 AdoptPet</h2>
              <p className="text-gray-300 text-sm mt-2">
                Temukan sahabat barumu, selamatkan nyawa.
              </p>
            </div>
  
            {/* Bagian Kanan / Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} AdoptPet Indonesia. All rights reserved.
              </p>
            </div>
            
          </div>
        </div>
      </footer>
    );
  }