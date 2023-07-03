import { iots } from '@code-expert/prelude';
import { ProjectId } from '@/domain/Project';

export const ProjectMetadata = iots.strict({
  projectId: ProjectId,
  exerciseName: iots.string,
  taskOrder: iots.number,
  exerciseOrder: iots.number,
  projectName: iots.string,
  taskName: iots.string,
  courseName: iots.string,
  semester: iots.string,
});

export type ProjectMetadata = iots.TypeOf<typeof ProjectMetadata>;
