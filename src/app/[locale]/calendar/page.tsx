import CalendarFilterComponent from "../../components/calendar/CalendarFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";
export default function CalendarPage() {
  return (
    <div className="h-full">
      <FiltersProvider>
        <CalendarFilterComponent />
      </FiltersProvider>
    </div>
  );
}
