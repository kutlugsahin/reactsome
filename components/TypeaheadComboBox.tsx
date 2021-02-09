import { useEffect, useState } from "react";
import { City } from "../interfaces";
import { cities } from "../utils/sample-data";

type PaginatedResult<T> = {
  total: number;
  take: number;
  skip: number;
  items: T[];
};
const take = 5;

const findCities = async (filter: string, skip: number, take: number) => {
  console.log(filter + " " + skip);
  if (!filter) {
    return Promise.resolve({
      total: 0,
      take: 0,
      skip: 0,
      items: [],
    });
  }

  return new Promise<PaginatedResult<City>>((resolve) => {
    setTimeout(() => {
      const filtered = cities
        .filter((c) => c.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
        .sort((a, b) => (a.name > b.name ? 1 : -1));
      resolve({
        total: filtered.length,
        take,
        skip,
        items: filtered.slice(skip, skip + take),
      });
    }, 1000);
  });
};

function SelectedItem(props: {
  city?: City;
  onSelectedCityCancelled: () => void;
}) {
  return (
    <div>
      {props.city && (
        <div>
          <span>{props.city.name}</span>
          <button onClick={props.onSelectedCityCancelled}>x</button>
        </div>
      )}
    </div>
  );
}

function TypeaheadList(props: {
  items: City[];
  onCitySelected: (city: City) => void;
}) {
  if (props.items.length === 0) {
    return <span>No matching item</span>;
  }
  return (
    <ul>
      {props.items.map((item) => (
        <li
          key={item.geonameid}
          onClick={() => {
            props.onCitySelected(item);
          }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}

export function TypeaheadComboBox() {
  const [filter, setFilter] = useState("");
  const [skip, setSkip] = useState(0);
  const [editMode, setEditMode] = useState(true);
  const [loadingMode, setLoadingMode] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    items: [],
    take: 0,
    skip: 0,
  } as PaginatedResult<City>);
  const [selectedCity, setSelectedCity] = useState<City>();
  const [debouncer, setDebouncer] = useState<NodeJS.Timeout>();
  useEffect(() => {
    if (debouncer) {
      clearTimeout(debouncer);
    }
    setDebouncer(
      setTimeout(async () => {
        setLoadingMode(true);
        setPagination(await findCities(filter, skip, take));
        setLoadingMode(false);
      }, 250)
    );
  }, [filter, skip]);
  return (
    <div>
      {editMode && (
        <input
          placeholder="Type to list suggestions"
          readOnly={loadingMode}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSkip(0);
            setSelectedCity(undefined);
          }}
        />
      )}
      <SelectedItem
        city={selectedCity}
        onSelectedCityCancelled={() => {
          setEditMode(true);
          setSelectedCity(undefined);
        }}
      />
      {!loadingMode && filter && editMode && (
        <div>
          <TypeaheadList
            items={pagination.items}
            onCitySelected={(city) => {
              setEditMode(false);
              setSelectedCity(city);
            }}
          />
          {pagination.total > take && (
            <div>
              <span>
                {pagination.skip + 1}..
                {pagination.skip + pagination.items.length}/{pagination.total}
              </span>

              <button
                disabled={skip === 0}
                onClick={() => {
                  if (skip >= take) {
                    setSkip(skip - take);
                  }
                }}
              >
                &#60;
              </button>
              <button
                disabled={skip >= pagination.total - take}
                onClick={() => {
                  if (skip < pagination.total - take) {
                    setSkip(skip + take);
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
