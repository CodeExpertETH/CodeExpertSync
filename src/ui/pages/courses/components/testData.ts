import { CourseItem } from '@/ui/pages/courses/components/model';

/**
 * Intentionally unordered to make sure the component sorts this.
 */
export const testCourses: Array<CourseItem> = [
  {
    semester: { season: 'S', year: 2021 },
    name: 'Anwendungsnahes Programmieren mit Python',
  },
  {
    semester: { season: 'S', year: 2021 },
    name: 'GYM KKS',
  },
  {
    semester: { season: 'A', year: 2020 },
    name: 'Cybathlon',
  },
  {
    semester: { season: 'A', year: 2020 },
    name: 'Anwendungsnahes Programmieren mit Python',
  },
];
