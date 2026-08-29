import type { PropsType } from './types';

const Header = (props: PropsType) => {
  const { title } = props;

  return (
    <div className="dashboard-page-header flex flex-col items-start">
      <div className="flex w-full flex-wrap items-start justify-between gap-3.5">
        <div>
          <h1 className="text-ink text-[23px] font-extrabold tracking-[-0.01em]">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Header;
