import { motion } from 'framer-motion';
import '../styles/ScheduleSection.css';

const ScheduleSection = () => {
  const participants = [
    { name: 'NO. OF COLLEGES', position: '250+', },
    { name: 'TOTAL PARTICIPANTS', position: '2800+', },
    { name: 'TEAMS', position: '75+', },
    { name: 'TRACKS', position: '5', },
    { name: 'HACKERS', position: '300+', },
  ];

  return (
    <section id="schedule" className="schedule-section">
      {/* Main circular design */}
      <div className="schedule-content">
        <motion.div 
          className="japan-circle"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="circle-text">
            <span className="japan-text">$946</span>
            <span className="gp-text text-s text-white" style={{ fontSize: '0.95em' }}>Prize Pool</span>
          </div>
        </motion.div>

        {/* Participants list */}
        <motion.div 
          className="participants-grid"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="participants-left">
            {participants.slice(0, 4).map((participant, index) => (
              <motion.div
                key={index}
                className="participant-row"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <span className="participant-position">{participant.position}</span>
                <span className="participant-name">{participant.name}</span>
              </motion.div>
            ))}
          </div>

          <div className="participants-right">
            {participants.slice(4).map((participant, index) => (
              <motion.div
                key={index + 4}
                className="participant-row"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 4) }}
              >
                <span className="participant-position">{participant.position}.</span>
                <span className="participant-name">{participant.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScheduleSection;