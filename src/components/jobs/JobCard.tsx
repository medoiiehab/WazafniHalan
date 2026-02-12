import { Link } from 'react-router-dom';
import { MapPin, Building2, Star, Timer, BriefcaseBusiness } from 'lucide-react';
import { Job, exclusiveTagLabels } from '@/types/database';

interface JobCardProps {
  job: Job;
}

// Placeholder work images
const placeholderImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=400&fit=crop',
];

const getJobImage = (job: Job) => {
  if (job.image_url) return job.image_url;
  const index = job.id.charCodeAt(0) % placeholderImages.length;
  return placeholderImages[index];
};

const JobCard = ({ job }: JobCardProps) => {
  const imageUrl = getJobImage(job);

  return (
    <Link to={`/job/${job.id}`} className="block group">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full bg-gradient-to-b from-card to-card/50">
        {/* Job Image Container */}
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={imageUrl}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

          {/* Badge Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {job.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-[10px] font-bold shadow-lg uppercase tracking-wider">
                <Star className="w-3 h-3 fill-current" />
                مميز
              </span>
            )}
            {job.exclusive_tag && job.exclusive_tag !== 'none' && (
              <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold shadow-md">
                {exclusiveTagLabels[job.exclusive_tag]}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-white text-[10px] font-medium border border-white/30">
            {job.country}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-[17px] font-bold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2 leading-tight">
            {job.title}
          </h3>

          <div className="flex flex-col gap-2 text-sm text-foreground font-medium mb-4">
            {job.company && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="truncate font-medium">{job.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-medium">{job.country}</span>
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
            {job.salary ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-foreground font-bold uppercase">الراتب المتوقع</span>
                <span className="text-sm font-bold text-primary">{job.salary}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                <Timer className="w-3.5 h-3.5" />
                <span>تم النشر حديثاً</span>
              </div>
            )}

            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <BriefcaseBusiness className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
