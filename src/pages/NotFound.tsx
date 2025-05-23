
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Fehler: Benutzer versuchte, auf nicht existierende Route zuzugreifen:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/50 px-4">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">404</h1>
        <p className="text-xl text-muted-foreground mb-4 max-w-sm mx-auto">
          Hoppla! Wir konnten die gesuchte Seite nicht finden.
        </p>
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
