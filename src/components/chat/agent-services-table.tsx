import { FC } from 'react';

interface Service {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface AgentServicesTableProps {
  services: Service[];
}

const detailsMap: Record<string, string> = {
  blessing_service: 'Send a greeting or a wish via a Tweet on X',
  bull_post_service: 'Shill your project and increase brand awareness',
  thread_creation: 'Create a Twitter thread to educate or inform',
  replies_service: 'Reply to accounts and drive engagement',
};

const etaMap: Record<string, string> = {
  blessing_service: '~2 mins',
  bull_post_service: '~5 mins',
  thread_creation: '~7 mins',
  replies_service: '~3 mins',
};

export const AgentServicesTable: FC<AgentServicesTableProps> = ({ services }) => {
  return (
    <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl bg-white">
      <table className="min-w-full text-[15px]">
        <thead>
          <tr className="bg-white">
            <th className="pl-6 pr-2 py-2 text-left font-semibold text-[#FF4D29]">Tasks</th>
            <th className="px-2 py-2 text-left font-medium text-[#8F95B2]">Details</th>
            <th className="px-2 py-2 text-left font-medium text-[#8F95B2]">ETA</th>
            <th className="px-2 py-2 text-left font-medium text-[#8F95B2]">Credits</th>
            <th className="px-2 py-2 text-left font-medium text-[#8F95B2]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, idx) => (
            <tr key={service.id} className={idx !== services.length - 1 ? "border-b border-[#E5E7EB]" : ""}>
              <td className="pl-6 pr-2 py-4 font-bold text-[#FF4D29] align-middle whitespace-nowrap">{service.name}</td>
              <td className="px-2 py-4 text-[#121212] align-middle max-w-[260px] whitespace-normal">
                {detailsMap[service.id]}
              </td>
              <td className="px-2 py-4 text-[#121212] align-middle whitespace-nowrap">{etaMap[service.id]}</td>
              <td className="px-2 py-4 align-middle whitespace-nowrap">
                <span className="flex items-center gap-1 font-semibold text-[#FF4D29]">
                  <img src="/assets/ensemble-icon.svg" alt="credits" className="w-4 h-4 inline-block" />
                  {service.price}
                </span>
              </td>
              <td className="px-2 py-4 align-middle whitespace-nowrap">
                <div className="flex gap-3 flex-nowrap">
                  <button className="border border-[#8F95B2] rounded-lg px-4 py-1 text-[#121212] bg-white hover:bg-gray-50 transition text-[15px]">Samples</button>
                  <button className="bg-[#FF4D29] text-white rounded-lg px-4 py-1 font-semibold hover:bg-[#e03e1a] transition text-[15px]">Create Task</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 