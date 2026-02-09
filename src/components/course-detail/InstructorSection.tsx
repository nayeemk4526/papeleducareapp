import { motion } from "framer-motion";
import { User, Mail, Phone, Award, BookOpen } from "lucide-react";
import { useTeacherById } from "@/hooks/useTeachers";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface InstructorSectionProps {
  instructor: {
    id: string;
    name: string;
    title: string | null;
    subtitle?: string | null;
    bio?: string | null;
    avatar_url: string | null;
  } | null;
}

const InstructorSection = ({ instructor }: InstructorSectionProps) => {
  const { data: fullInstructor } = useTeacherById(instructor?.id || "");
  
  const displayInstructor = fullInstructor || instructor;

  if (!displayInstructor) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl p-6 border border-border mb-8"
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        কোর্স ইনস্ট্রাক্টর
      </h3>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {displayInstructor.avatar_url ? (
            <img
              src={displayInstructor.avatar_url}
              alt={displayInstructor.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {displayInstructor.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="text-xl font-bold mb-1">{displayInstructor.name}</h4>
          {displayInstructor.title && (
            <p className="text-primary font-medium mb-1">{displayInstructor.title}</p>
          )}
          {fullInstructor?.subtitle && (
            <p className="text-sm text-muted-foreground mb-3">{fullInstructor.subtitle}</p>
          )}

          {/* Specializations */}
          {fullInstructor?.specializations && fullInstructor.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {fullInstructor.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          )}

          {/* Bio */}
          {(displayInstructor.bio || fullInstructor?.bio) && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {displayInstructor.bio || fullInstructor?.bio}
            </p>
          )}

          {/* Contact & Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            {fullInstructor?.email && (
              <a
                href={`mailto:${fullInstructor.email}`}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                {fullInstructor.email}
              </a>
            )}
            {fullInstructor?.phone && (
              <a
                href={`tel:${fullInstructor.phone}`}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {fullInstructor.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorSection;
