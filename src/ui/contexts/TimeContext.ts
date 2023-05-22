import React from 'react';
import { io } from '@code-expert/prelude';

export interface TimeContext {
  now: io.IO<Date>;
}

export const timeContext: TimeContext = {
  now: () => new Date(),
};

const context = React.createContext(timeContext);

export const TimeContextProvider = context.Provider;

export const useTimeContext = () => React.useContext(context);
