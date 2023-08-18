import { List as AntList, Button, Typography } from 'antd';
import React from 'react';
import { nonEmptyArray, option, pipe } from '@code-expert/prelude';
import { VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';
import { CourseItem, courseItemKey, coursesBySemester } from '@/ui/pages/courses/components/model';

const StyledAntList = styled(AntList as typeof AntList<CourseItem>, ({ tokens }) => ({
  borderBlock: `1px solid ${tokens.colorSplit}`,
}));

export interface CourseListProps {
  courses: Array<CourseItem>;
  onOpen: (course: CourseItem) => void;
}

export const CourseList = ({ courses, onOpen }: CourseListProps) =>
  pipe(
    nonEmptyArray.fromArray(courses),
    option.map(coursesBySemester),
    option.map((groupedCourses) => (
      <VStack gap="lg">
        {groupedCourses.map(({ semester, courses: dataSource }) => (
          <VStack key={semester} gap="xs">
            <Typography.Text type="secondary">{semester}</Typography.Text>
            <StyledAntList
              size="small"
              dataSource={dataSource}
              rowKey={courseItemKey}
              renderItem={(course) => <ListItem course={course} onOpen={onOpen} />}
            />
          </VStack>
        ))}
      </VStack>
    )),
    option.getOrElse(() => <Typography.Text type="secondary">No courses</Typography.Text>),
  );

// -------------------------------------------------------------------------------------------------

const StyledAntListItem = styled(AntList.Item, () => ({
  paddingInline: '0 !important',
}));

const StyledButton = styled(Button, ({ tokens }) => ({
  whiteSpace: 'normal',
  padding: 0,
  textAlign: 'left',
  height: 'auto',
  paddingBlock: 2,
  '&.ant-btn': {
    color: tokens.colorText,
    '&:hover': {
      color: tokens.colorLink,
    },
    '&:active': {
      color: tokens.colorLinkActive,
    },
    '&:disabled': {
      color: tokens.colorTextDisabled,
      cursor: 'wait',
    },
  },
}));

interface ListItemProps {
  course: CourseItem;
  onOpen: (course: CourseItem) => void;
}

const ListItem = ({ course, onOpen }: ListItemProps) => (
  <StyledAntListItem>
    <StyledButton type={'link'} block onClick={() => onOpen(course)}>
      {course.name}
    </StyledButton>
  </StyledAntListItem>
);
