import { useEffect, useState } from "react";
import { PaginatedResult } from "../interfaces";
import { CancellablePromise } from "../utils/api";

function SelectedItem<T>(props: {
  item?: T;
  getLabel: (item: T) => React.ReactNode;
  onSelectedItemCancelled: () => void;
}) {
  return (
    <div>
      {props.item && (
        <div>
          <span>{props.getLabel(props.item)}</span>
          <button onClick={props.onSelectedItemCancelled}>x</button>
        </div>
      )}
    </div>
  );
}

function TypeaheadList<T>(props: {
  items: T[];
  onItemSelected: (item: T) => void;
  getLabel: (item: T) => React.ReactNode;
  getId: (item: T) => string;
}) {
  if (props.items.length === 0) {
    return <span>No matching item</span>;
  }
  return (
    <ul>
      {props.items.map((item) => (
        <li
          key={props.getId(item)}
          onClick={() => {
            props.onItemSelected(item);
          }}
        >
          {props.getLabel(item)}
        </li>
      ))}
    </ul>
  );
}

export function TypeaheadComboBox<T>(props: {
  getLabel: (item: T) => React.ReactNode;
  getId: (item: T) => string;
  fetchData: (
    filter: string,
    skip: number,
    take: number
  ) => CancellablePromise<PaginatedResult<T>>;
  pageSize: number;
}) {
  const [filter, setFilter] = useState("");
  const [skip, setSkip] = useState(0);
  const [editMode, setEditMode] = useState(true);
  const [loadingMode, setLoadingMode] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    items: [],
    take: 0,
    skip: 0,
  } as PaginatedResult<T>);
  const [selectedItem, setSelectedItem] = useState<T>();
  const [debouncer, setDebouncer] = useState<NodeJS.Timeout>();
  useEffect(() => {
    let fetcher: CancellablePromise<PaginatedResult<T>>;
    if (debouncer) {
      clearTimeout(debouncer);
    }
    setDebouncer(
      setTimeout(async () => {
        setLoadingMode(true);
        fetcher = props.fetchData(filter, skip, props.pageSize);
        fetcher.then(setPagination);
      }, 250)
    );

    return () => {
      fetcher?.cancel();
    };
  }, [filter, skip]);
  return (
    <div>
      {editMode && (
        <input
          placeholder="Type to list suggestions"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSkip(0);
            setSelectedItem(undefined);
          }}
        />
      )}
      <SelectedItem
        item={selectedItem}
        onSelectedItemCancelled={() => {
          setEditMode(true);
          setSelectedItem(undefined);
        }}
        getLabel={props.getLabel}
      />
      {!loadingMode && filter && editMode && (
        <div>
          <TypeaheadList
            items={pagination.items}
            onItemSelected={(item) => {
              setEditMode(false);
              setSelectedItem(item);
            }}
            getLabel={props.getLabel}
            getId={props.getId}
          />
          {pagination.total > props.pageSize && (
            <div>
              <span>
                {pagination.skip + 1}..
                {pagination.skip + pagination.items.length}/{pagination.total}
              </span>

              <button
                disabled={skip === 0}
                onClick={() => {
                  if (skip >= props.pageSize) {
                    setSkip(skip - props.pageSize);
                  }
                }}
              >
                &#60;
              </button>
              <button
                disabled={skip >= pagination.total - props.pageSize}
                onClick={() => {
                  if (skip < pagination.total - props.pageSize) {
                    setSkip(skip + props.pageSize);
                  }
                }}
              >
                &#62;
              </button>
            </div>
          )}
        </div>
      )}
      {loadingMode === true && <div>Fetching data</div>}
    </div>
  );
}

export default TypeaheadComboBox;
