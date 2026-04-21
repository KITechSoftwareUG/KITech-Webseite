import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";

const NotFound = () => {
  return (
    <Layout>
      <SEOHead
        title="Seite nicht gefunden | KITech Software"
        description="Die gesuchte Seite existiert nicht oder wurde verschoben."
        canonical="/404"
        noindex={true}
      />
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-light text-primary mb-4">404</h1>
        <h2 className="text-2xl font-light mb-4">Seite nicht gefunden</h2>
        <p className="text-muted-foreground mb-8">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link to="/" className="text-primary hover:underline">
          Zurück zur Startseite
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
