import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Country } from '@/data/jobs';

interface CountryCardProps {
  country: Country;
}

const CountryCard = ({ country }: CountryCardProps) => {
  return (
    <Link
      to={`/jobs/${country.slug}`}
      className="job-card flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{country.flag}</span>
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            وظائف {country.name}
          </h3>
          <p className="text-sm text-foreground font-semibold">
            {country.jobCount} وظيفة متاحة
          </p>
        </div>
      </div>
      <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
    </Link>
  );
};

export default CountryCard;
