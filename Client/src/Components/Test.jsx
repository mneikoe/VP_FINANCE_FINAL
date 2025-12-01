import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeadOccupationDetails } from "../redux/feature/LeadOccupation/OccupationThunx";
import { fetchDetails } from "../redux/feature/LeadSource/LeadThunx";

const Test = () => {
  const leadOccupations = useSelector((state) => state.leadOccupation.details);

  const leadSources = useSelector((state) => state.leadsource.leadsourceDetail);

  const dispatch = useDispatch();

  console.log(leadOccupations, "LEAD OCCUPATION");
  console.log(leadSources, "LEAD SOURCE");

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(fetchLeadOccupationDetails()).unwrap();
        await dispatch(fetchDetails()).unwrap();
      } catch (error) {
        console.log(error);
      }
    };

    init();
  }, []);

  return <div>Test</div>;
};

export default Test;
