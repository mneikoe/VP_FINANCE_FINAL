import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AddSuspect from "./AddSuspect";
const SuspectEditWrapper = () => {
  const { id } = useParams();
  const { suspects } = useSelector((state) => state.suspect);

  // Store से उस suspect को ढूंढो
  const suspectData = suspects.find((s) => s._id === id);

  return (
    <AddSuspect 
      isEdit={true} 
      suspectData={suspectData} 
    />
  );
};
export default  SuspectEditWrapper
