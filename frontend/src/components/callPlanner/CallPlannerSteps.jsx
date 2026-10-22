import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import "./CallPlannerSteps.css";
export default function CallPlannerSteps({ step, steps, answers, choose }) { return (<><h3 className="planner-question">{steps[step][0]}</h3>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="options"
            >
              {steps[step][1].map((a) => (
                <button
                  key={a}
                  className={answers[step] === a ? "chosen" : ""}
                  onClick={() => choose(a)}
                >
                  {a}
                  <ArrowRight size={18} />
                </button>
              ))}
            </motion.div>
          </>); }
