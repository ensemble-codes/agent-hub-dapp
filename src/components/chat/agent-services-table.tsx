import { FC, useState, useEffect } from 'react';

interface Service {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface AgentServicesTableProps {
  services: Service[];
  onCreateTask?: (service: Service) => void;
}

export const AgentServicesTable: FC<AgentServicesTableProps> = ({ services, onCreateTask }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleRows, setVisibleRows] = useState<number[]>([]);

  useEffect(() => {
    // Show table container first
    setIsVisible(true);
    
    // Then reveal rows one by one
    services.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleRows(prev => [...prev, idx]);
      }, idx * 150); // 150ms delay between each row
    });
  }, [services]);

  return (
    <div className={`max-w-[70%] z-[2] overflow-x-auto border border-[#E5E7EB] rounded-xl bg-white transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <table className="min-w-full text-[15px]">
        <thead>
          <tr className="bg-white">
            <th className="pl-6 pr-2 py-2 text-left font-semibold text-[#FF4D29]">Tasks</th>
            <th className="px-2 py-2 text-left font-medium text-[#8F95B2]">Credits</th>
            <th className="px-2 py-2 text-left font-medium text-[#8F95B2]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services?.map((service, idx) => (
            <tr 
              key={service.id} 
              className={`transition-all duration-300 ease-out ${
                idx !== services.length - 1 ? "border-b border-[#E5E7EB]" : ""
              } ${
                visibleRows.includes(idx)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              }`}
            >
              <td className="pl-6 pr-2 py-4 font-bold text-[#FF4D29] align-middle whitespace-nowrap">{service.name}</td>
              <td className="px-2 py-4 align-middle whitespace-nowrap">
                <span className="flex items-center gap-1 font-semibold text-[#FF4D29]">
                  <img src="/assets/ensemble-icon.svg" alt="credits" className="w-4 h-4 inline-block" />
                  {service.price}
                </span>
              </td>
              <td className="px-2 py-4 align-middle whitespace-nowrap">
                <div className="flex gap-3 flex-nowrap">
                  <button className="border border-[#8F95B2] rounded-lg px-4 py-1 text-[#121212] bg-white hover:bg-gray-50 transition text-[15px]">Samples</button>
                  <button
                    className="bg-[#FF4D29] text-white rounded-lg px-4 py-1 font-semibold hover:bg-[#e03e1a] transition text-[15px]"
                    onClick={() => onCreateTask?.(service)}
                  >
                    Create Task
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 