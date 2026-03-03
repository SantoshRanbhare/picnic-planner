import { useState } from "react";
import { supabase } from "../supabase";

export default function JoinForm() {
  const [joining, setJoining] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [suggestion, setSuggestion] = useState("");

  const handleSubmit = async () => {
    if (!joining) return alert("Select Yes or No");

    const { error } = await supabase
      .from("attendees")
      .insert([{ name, joining, color, suggestion }]);

    if (error) {
      alert("Error submitting");
      console.log(error);
    } else {
      alert("Submitted 🎉");
      window.location.reload();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        🌳 Cubbon Park Picnic
      </h2>

      <div className="mb-4">
        <label>
          <input type="radio" onChange={() => setJoining("yes")} />
          <span className="ml-2">Yes</span>
        </label>

        <label className="ml-6">
          <input type="radio" onChange={() => setJoining("no")} />
          <span className="ml-2">No</span>
        </label>
      </div>

      {joining === "yes" && (
        <>
          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Your Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="color"
            className="mb-3"
            onChange={(e) => setColor(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-3 rounded"
            placeholder="Any suggestion?"
            onChange={(e) => setSuggestion(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-xl w-full"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}