export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-foreground/10 bg-background/50 backdrop-blur-sm">
      <div className="border-t border-foreground/10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/50">
          <p>© {currentYear} Snippit. Built for developers.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/fahadwaseem8/snippit" target="_blank" rel="noreferrer" className="hover:text-foreground transition">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
