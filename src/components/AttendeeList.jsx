import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AttendeeList() {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("attendees")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setAttendees(data);
  };

  const joining = attendees.filter(a => a.joining === "yes");

  return (
    <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-green-700 mb-3">
        🎉 {joining.length} People Joining
      </h3>

      {joining.map((person) => (
        <div key={person.id} className="border-b py-2">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ background: person.color }}
          ></span>
          {person.name}

          {person.suggestion && (
            <div className="text-sm text-gray-600">
              💡 {person.suggestion}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}