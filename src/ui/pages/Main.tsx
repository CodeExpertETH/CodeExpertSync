import React from 'react';
import { ClientId } from '@/domain/ClientId';
import { Projects } from './projects';

export function Main(props: { clientId: ClientId }) {
  return (
    <div>
      <div className="row">
        <Projects clientId={props.clientId} />
      </div>
    </div>
  );
}
