import { motion } from "framer-motion";
import { FileText, Download, File, FileImage, FileVideo, Lock } from "lucide-react";
import { useCourseMaterials, formatFileSize } from "@/hooks/useCourseMaterials";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useIsEnrolled } from "@/hooks/useEnrollments";

interface CourseMaterialsSectionProps {
  courseId: string;
}

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return File;
  if (fileType.includes("pdf")) return FileText;
  if (fileType.includes("image")) return FileImage;
  if (fileType.includes("video")) return FileVideo;
  return File;
};

const CourseMaterialsSection = ({ courseId }: CourseMaterialsSectionProps) => {
  const { user } = useAuth();
  const { data: isEnrolled } = useIsEnrolled(courseId);
  const { data: materials, isLoading } = useCourseMaterials(courseId);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl p-6 border border-border mb-8"
      >
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!materials || materials.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl p-6 border border-border mb-8"
    >
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        কোর্স ম্যাটেরিয়ালস
      </h3>

      <div className="space-y-3">
        {materials.map((material) => {
          const Icon = getFileIcon(material.file_type);
          const canDownload = isEnrolled && material.is_downloadable;

          return (
            <div
              key={material.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{material.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {material.file_type?.split("/")[1]?.toUpperCase() || "FILE"}
                    {material.file_size_bytes && ` • ${formatFileSize(material.file_size_bytes)}`}
                  </p>
                </div>
              </div>

              {canDownload ? (
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              ) : (
                <div className="p-2 rounded-full bg-muted text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isEnrolled && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          ম্যাটেরিয়ালস ডাউনলোড করতে কোর্সে এনরোল করুন
        </p>
      )}
    </motion.div>
  );
};

export default CourseMaterialsSection;
