import TypeaheadComboBox from "../components/TypeaheadComboBox";
import { City } from "../interfaces/index";
import { findCities } from "../utils/api";
const IndexPage = () => (
  <TypeaheadComboBox
    getId={(item: City) => {
      return item.geonameid.toString();
    }}
    getLabel={(item: City) => {
      return item.name;
    }}
    fetchData={findCities}
    pageSize={5}
  />
);

export default IndexPage;
