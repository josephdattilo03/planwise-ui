import NewTaskComponent from "@/src/app/components/tasks/NewTaskComponent";

export default function NewTaskPage() {
  return (
    <main className="overflow-hidden flex bg-white">
      <div className="flex-1">
        <NewTaskComponent />
      </div>
    </main>
  );
}
