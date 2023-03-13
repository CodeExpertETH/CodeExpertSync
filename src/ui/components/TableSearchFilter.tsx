import { pipe, string } from '@code-expert/prelude';
import { Button, Input, InputRef } from 'antd';
import { ColumnGroupType, ColumnType } from 'antd/es/table';
import React from 'react';

import { Icon } from '../foundation/Icons';

function getColumnSearchProps<A>(dataIndex: string): ColumnGroupType<A> | ColumnType<A> {
  let searchInput: InputRef | null;
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<Icon name="search" />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => clearFilters != null && clearFilters()}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <Icon className="anticon" name="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      // In userland, this is a concrete type, but here we only have access to the generic
      // placeholder. We do know that it is a record, but double-check that in the code.
      const datum = (record as unknown as Record<string, string | number | boolean>)[dataIndex];
      return datum == null || pipe(datum.toString(), string.looseIncludes(value.toString()));
    },
    onFilterDropdownOpenChange: (v) => {
      if (v) {
        setTimeout(() => searchInput != null && searchInput.select());
      }
    },
  };
}

export function getColumnSearchPropsAcc<A>(
  label: string,
  accessor: (a: A) => string,
): ColumnGroupType<A> | ColumnType<A> {
  let searchInput: InputRef | null;
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput = node;
          }}
          placeholder={`Search ${label}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<Icon name="search" />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => clearFilters != null && clearFilters()}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <Icon className="anticon" name="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => pipe(accessor(record), string.looseIncludes(value.toString())),
    onFilterDropdownOpenChange: (v) => {
      if (v) {
        setTimeout(() => searchInput != null && searchInput.select());
      }
    },
  };
}

export default getColumnSearchProps;
