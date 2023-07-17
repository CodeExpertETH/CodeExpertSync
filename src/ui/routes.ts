import React from 'react';
import { tagged } from '@code-expert/prelude';
import { CourseItem } from '@/ui/pages/courses/components/model';
import { requireNonNull } from '@/utils/error';

export type Route =
  | tagged.Tagged<'courses'>
  | tagged.Tagged<'projects', { course: CourseItem }>
  | tagged.Tagged<'settings'>
  | tagged.Tagged<'logout'>
  | tagged.Tagged<'developer'>;

export const routes = tagged.build<Route>();

// -------------------------------------------------------------------------------------------------

type RouteContext = { currentRoute: Route; navigateTo(route: Route): void };

const context = React.createContext<RouteContext | undefined>(undefined);

export const RouteContextProvider = React.memo(function RouteContextProvider({
  children,
}: React.PropsWithChildren) {
  const [currentRoute, setCurrentRoute] = React.useState(routes.wide.courses());
  return React.createElement(
    context.Provider,
    { value: { currentRoute, navigateTo: setCurrentRoute } },
    children,
  );
});

export const useRoute = () =>
  requireNonNull(
    React.useContext(context),
    'useRoute must not be used without a RouteContextProvider',
  );
