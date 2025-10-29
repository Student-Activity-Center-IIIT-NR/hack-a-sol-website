import { motion } from 'framer-motion';
import '../styles/ScheduleSection.css';

const ScheduleSection = () => {
  const participants = [
    { name: 'FRONTEND TEAMS', position: '01', time: '1:30:55.026' },
    { name: 'BACKEND SQUADS', position: '02', time: '2:31:18' },
    { name: 'FULLSTACK CREW', position: '03', time: '3:22:62' },
    { name: 'MOBILE DEVS', position: '04', time: '4:9:748' },
    { name: 'AI/ML EXPERTS', position: '05', time: '5:11:096' },
    { name: 'BLOCKCHAIN BUILDERS', position: '06', time: '6:6:536' },
    { name: 'DESIGN SPECIALISTS', position: '07', time: '7:70:20' },
    { name: 'DATA SCIENTISTS', position: '08', time: '8:1:115' },
  ];

  return (
    <section id="schedule" className="schedule-section">
      {/* Header with menu */}
      <div className="schedule-header">
        <div className="menu-label">MENU</div>
      </div>

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
            <span className="japan-text">HACK-A-SOL</span>
            <span className="gp-text">GP.</span>
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
                <span className="participant-position">{participant.position}.</span>
                <span className="participant-name">{participant.name}</span>
                <span className="participant-time">-{participant.time}</span>
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
                <span className="participant-time">-{participant.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScheduleSection;