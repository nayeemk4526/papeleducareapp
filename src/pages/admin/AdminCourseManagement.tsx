import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronRight, 
  Video, FileText, Lightbulb, Users, BookOpen, Settings,
  GripVertical, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin/AdminLayout";
import CourseDialog from "@/components/admin/CourseDialog";
import SectionDialog from "@/components/admin/SectionDialog";
import LessonDialog from "@/components/admin/LessonDialog";
import MaterialDialog from "@/components/admin/MaterialDialog";
import LearningOutcomeDialog from "@/components/admin/LearningOutcomeDialog";
import EnrollmentDialog from "@/components/admin/EnrollmentDialog";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { useAdminSections, useDeleteSection } from "@/hooks/useAdminSections";
import { useAdminLessons, useDeleteLesson } from "@/hooks/useAdminLessons";
import { useAdminCourseMaterials, useDeleteCourseMaterial } from "@/hooks/useAdminCourseMaterials";
import { useCourseLearningOutcomes, useDeleteLearningOutcome } from "@/hooks/useCourseLearningOutcomes";
import { useAdminEnrollments } from "@/hooks/useAdminEnrollments";

const AdminCourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const { data: courses } = useAdminCourses();
  const course = courses?.find(c => c.id === courseId);
  
  const { data: sections, isLoading: sectionsLoading } = useAdminSections(courseId);
  const { data: lessons } = useAdminLessons(courseId);
  const { data: materials } = useAdminCourseMaterials(courseId);
  const { data: outcomes } = useCourseLearningOutcomes(courseId);
  const { data: enrollments } = useAdminEnrollments(courseId);
  
  const deleteSection = useDeleteSection();
  const deleteLesson = useDeleteLesson();
  const deleteMaterial = useDeleteCourseMaterial();
  const deleteOutcome = useDeleteLearningOutcome();
  
  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  
  // Selected items for editing
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<any>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  
  // Collapsed sections
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  if (!course) {
    return (
      <AdminLayout title="কোর্স পাওয়া যায়নি">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">এই কোর্সটি পাওয়া যায়নি।</p>
          <Button onClick={() => navigate("/admin/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            কোর্স লিস্টে ফিরুন
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleEditSection = (section: any) => {
    setSelectedSection(section);
    setSectionDialogOpen(true);
  };

  const handleAddLesson = (sectionId?: string) => {
    setSelectedLesson(null);
    setCurrentSectionId(sectionId);
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setCurrentSectionId(lesson.section_id);
    setLessonDialogOpen(true);
  };

  const handleEditMaterial = (material: any) => {
    setSelectedMaterial(material);
    setMaterialDialogOpen(true);
  };

  const handleEditOutcome = (outcome: any) => {
    setSelectedOutcome(outcome);
    setOutcomeDialogOpen(true);
  };

  const handleDelete = (type: string, id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !courseId) return;
    
    switch (deleteTarget.type) {
      case "section":
        await deleteSection.mutateAsync({ id: deleteTarget.id, courseId });
        break;
      case "lesson":
        await deleteLesson.mutateAsync({ id: deleteTarget.id, courseId });
        break;
      case "material":
        await deleteMaterial.mutateAsync({ id: deleteTarget.id, courseId });
        break;
      case "outcome":
        await deleteOutcome.mutateAsync({ id: deleteTarget.id, courseId });
        break;
    }
    
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // Group lessons by section
  const getLessonsForSection = (sectionId: string) => {
    return lessons?.filter(l => l.section_id === sectionId) || [];
  };

  // Lessons without section
  const unassignedLessons = lessons?.filter(l => !l.section_id) || [];

  return (
    <AdminLayout 
      title={course.title} 
      subtitle="কোর্স কনটেন্ট ম্যানেজমেন্ট"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          কোর্স লিস্টে ফিরুন
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCourseDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            সেটিংস
          </Button>
          <Button variant="outline" onClick={() => setEnrollmentDialogOpen(true)}>
            <Users className="w-4 h-4 mr-2" />
            স্টুডেন্ট এনরোল
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sections?.length || 0}</p>
              <p className="text-xs text-muted-foreground">সেকশন</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lessons?.length || 0}</p>
              <p className="text-xs text-muted-foreground">লেসন</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{materials?.length || 0}</p>
              <p className="text-xs text-muted-foreground">ম্যাটেরিয়াল</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enrollments?.length || 0}</p>
              <p className="text-xs text-muted-foreground">এনরোলমেন্ট</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="w-full md:w-auto mb-6">
          <TabsTrigger value="curriculum">কারিকুলাম</TabsTrigger>
          <TabsTrigger value="materials">ম্যাটেরিয়ালস</TabsTrigger>
          <TabsTrigger value="outcomes">যা শিখবে</TabsTrigger>
          <TabsTrigger value="students">শিক্ষার্থী</TabsTrigger>
        </TabsList>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">সেকশন ও লেসন</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddLesson(undefined)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  লেসন যোগ করুন
                </Button>
                <Button 
                  size="sm"
                  className="gradient-primary"
                  onClick={() => {
                    setSelectedSection(null);
                    setSectionDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  সেকশন যোগ করুন
                </Button>
              </div>
            </div>

            {sectionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sections with lessons */}
                {sections?.map((section, index) => (
                  <Collapsible
                    key={section.id}
                    open={expandedSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <div className="border border-border rounded-lg">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{section.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {getLessonsForSection(section.id).length} টি লেসন
                              </p>
                            </div>
                            {!section.is_published && (
                              <Badge variant="outline" className="ml-2">
                                <EyeOff className="w-3 h-3 mr-1" />
                                ড্রাফট
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSection(section);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete("section", section.id, section.title);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {expandedSections.includes(section.id) ? (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t border-border p-4 space-y-2 bg-muted/20">
                          {getLessonsForSection(section.id).map((lesson) => (
                            <div 
                              key={lesson.id}
                              className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                            >
                              <div className="flex items-center gap-3">
                                <Video className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{lesson.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {lesson.video_duration_minutes && (
                                      <span>{lesson.video_duration_minutes} মিনিট</span>
                                    )}
                                    {lesson.is_free_preview && (
                                      <Badge variant="secondary" className="text-xs">ফ্রি</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleEditLesson(lesson)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDelete("lesson", lesson.id, lesson.title)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => handleAddLesson(section.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            লেসন যোগ করুন
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}

                {/* Unassigned Lessons */}
                {unassignedLessons.length > 0 && (
                  <div className="border border-dashed border-border rounded-lg p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      সেকশনবিহীন লেসন
                    </p>
                    <div className="space-y-2">
                      {unassignedLessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Video className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              {lesson.video_duration_minutes && (
                                <span className="text-xs text-muted-foreground">
                                  {lesson.video_duration_minutes} মিনিট
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDelete("lesson", lesson.id, lesson.title)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!sections || sections.length === 0) && unassignedLessons.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>এই কোর্সে এখনো কোনো সেকশন বা লেসন যোগ করা হয়নি।</p>
                    <p className="text-sm mt-2">উপরের বাটন ব্যবহার করে সেকশন বা লেসন যোগ করুন।</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">কোর্স ম্যাটেরিয়ালস</h3>
              <Button 
                size="sm"
                className="gradient-primary"
                onClick={() => {
                  setSelectedMaterial(null);
                  setMaterialDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                ম্যাটেরিয়াল যোগ করুন
              </Button>
            </div>

            {materials && materials.length > 0 ? (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div 
                    key={material.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{material.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {material.file_type && <span>{material.file_type}</span>}
                          {material.is_downloadable && (
                            <Badge variant="outline" className="text-xs">ডাউনলোডযোগ্য</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleEditMaterial(material)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete("material", material.id, material.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>এই কোর্সে এখনো কোনো ম্যাটেরিয়াল যোগ করা হয়নি।</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Learning Outcomes Tab */}
        <TabsContent value="outcomes">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">যা শিখবে</h3>
              <Button 
                size="sm"
                className="gradient-primary"
                onClick={() => {
                  setSelectedOutcome(null);
                  setOutcomeDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                যোগ করুন
              </Button>
            </div>

            {outcomes && outcomes.length > 0 ? (
              <div className="space-y-3">
                {outcomes.map((outcome, index) => (
                  <div 
                    key={outcome.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-sm font-medium text-green-500">
                        {index + 1}
                      </div>
                      <p className="text-sm">{outcome.content}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleEditOutcome(outcome)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete("outcome", outcome.id, outcome.content)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>এই কোর্সে "যা শিখবে" তালিকা এখনো যোগ করা হয়নি।</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">এনরোলড শিক্ষার্থী ({enrollments?.length || 0})</h3>
              <Button 
                size="sm"
                className="gradient-primary"
                onClick={() => setEnrollmentDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                স্টুডেন্ট এনরোল
              </Button>
            </div>

            {enrollments && enrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">শিক্ষার্থী</th>
                      <th className="text-left p-3 text-sm font-medium">এনরোল তারিখ</th>
                      <th className="text-left p-3 text-sm font-medium">প্রগ্রেস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment: any) => (
                      <tr key={enrollment.id} className="border-t border-border">
                        <td className="p-3">
                          <p className="font-medium">{enrollment.user_id}</p>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(enrollment.enrolled_at).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${enrollment.progress_percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {enrollment.progress_percentage || 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>এই কোর্সে এখনো কোনো শিক্ষার্থী এনরোল হয়নি।</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        course={course}
      />

      <SectionDialog
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        courseId={courseId!}
        section={selectedSection}
        nextOrder={(sections?.length || 0) + 1}
      />

      <LessonDialog
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        courseId={courseId!}
        sectionId={currentSectionId}
        lesson={selectedLesson}
        nextOrder={(lessons?.length || 0) + 1}
      />

      <MaterialDialog
        open={materialDialogOpen}
        onOpenChange={setMaterialDialogOpen}
        courseId={courseId!}
        material={selectedMaterial}
      />

      <LearningOutcomeDialog
        open={outcomeDialogOpen}
        onOpenChange={setOutcomeDialogOpen}
        courseId={courseId!}
        outcome={selectedOutcome}
        nextOrder={(outcomes?.length || 0) + 1}
      />

      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={setEnrollmentDialogOpen}
        courseId={courseId!}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" মুছে ফেললে এটি ফিরিয়ে আনা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCourseManagement;
