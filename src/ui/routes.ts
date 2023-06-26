import React from 'react';
import { tagged } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { requireNonNull } from '@/domain/exception';
import { CourseItem } from '@/ui/pages/courses/components/model';

export type Route =
  | tagged.Tagged<'startup'>
  | tagged.Tagged<'courses', ClientId>
  | tagged.Tagged<'projects', { clientId: ClientId; course: CourseItem }>
  | tagged.Tagged<'settings', ClientId>
  | tagged.Tagged<'logout', ClientId>
  | tagged.Tagged<'developer', ClientId>;

export const routes = tagged.build<Route>();

// -------------------------------------------------------------------------------------------------

type RouteContext = { currentRoute: Route; navigateTo(route: Route): void };

const context = React.createContext<RouteContext | undefined>(undefined);

export const RouteContextProvider = React.memo(function RouteContextProvider({
  children,
}: React.PropsWithChildren) {
  const [currentRoute, setCurrentRoute] = React.useState(routes.wide.startup());
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
