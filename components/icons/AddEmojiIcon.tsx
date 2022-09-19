/* eslint-disable react/no-unknown-property */

interface Props {
  onClick?: () => void;
}

function AddEmojiIcon({ onClick }: Props) {
  return (
    <svg
      onClick={onClick}
      className="cursor-pointer"
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 30 30"
      fill="none"
    >
      <path
        d="M21.875 15C22.7856 14.9877 23.6895 15.1565 24.5343 15.4964C25.3791 15.8364 26.1479 16.3408 26.7962 16.9804C27.4444 17.6199 27.9591 18.3819 28.3105 19.222C28.6618 20.0622 28.8427 20.9637 28.8427 21.8744C28.8427 22.785 28.6618 23.6866 28.3105 24.5267C27.9591 25.3669 27.4444 26.1288 26.7962 26.7684C26.1479 27.408 25.3791 27.9124 24.5343 28.2523C23.6895 28.5923 22.7856 28.761 21.875 28.7488C20.0516 28.7488 18.303 28.0244 17.0136 26.7351C15.7243 25.4458 15 23.6971 15 21.8738C15 20.0504 15.7243 18.3017 17.0136 17.0124C18.303 15.7231 20.0516 14.9988 21.875 14.9987V15ZM15 2.49625C21.905 2.49625 27.5025 8.09375 27.5025 14.9987C27.5025 15.3275 27.49 15.6538 27.465 15.9763C26.9148 15.454 26.2942 15.0114 25.6212 14.6613C25.5554 12.5893 24.8848 10.5818 23.6923 8.88618C22.4998 7.19052 20.8373 5.8807 18.9097 5.11804C16.9821 4.35539 14.8735 4.17322 12.8436 4.59397C10.8138 5.01471 8.95129 6.02 7.48562 7.48601C6.01994 8.95202 5.01508 10.8147 4.5948 12.8447C4.17452 14.8746 4.35717 16.9832 5.12026 18.9107C5.88335 20.8381 7.19355 22.5003 8.88949 23.6924C10.5854 24.8845 12.593 25.5546 14.665 25.62C15.015 26.295 15.4587 26.915 15.9775 27.4625C15.6562 27.4875 15.33 27.5 15 27.5C8.095 27.5 2.4975 21.9025 2.4975 14.9987C2.4975 8.095 8.095 2.4975 15 2.4975V2.49625ZM21.875 17.4963L21.7625 17.5063C21.6376 17.5291 21.5226 17.5894 21.4329 17.6791C21.3431 17.7689 21.2828 17.8839 21.26 18.0087L21.25 18.1213V21.2463L18.1225 21.25L18.01 21.26C17.8851 21.2828 17.7701 21.3431 17.6804 21.4329C17.5906 21.5226 17.5303 21.6376 17.5075 21.7625L17.4975 21.875L17.5075 21.9875C17.5303 22.1124 17.5906 22.2274 17.6804 22.3171C17.7701 22.4069 17.8851 22.4672 18.01 22.49L18.1225 22.5H21.25V25.63L21.26 25.7425C21.283 25.8672 21.3434 25.9819 21.4332 26.0714C21.5229 26.1609 21.6378 26.221 21.7625 26.2438L21.875 26.255L21.9875 26.2438C22.1124 26.2209 22.2274 26.1606 22.3171 26.0709C22.4069 25.9811 22.4672 25.8661 22.49 25.7413L22.5 25.6288V22.4988L25.63 22.5L25.7425 22.49C25.8674 22.4672 25.9824 22.4069 26.0721 22.3171C26.1619 22.2274 26.2222 22.1124 26.245 21.9875L26.255 21.875L26.245 21.7625C26.2222 21.6376 26.1619 21.5226 26.0721 21.4329C25.9824 21.3431 25.8674 21.2828 25.7425 21.26L25.63 21.25H22.5V18.125L22.49 18.0125C22.4674 17.8874 22.4072 17.7721 22.3174 17.6821C22.2276 17.5921 22.1125 17.5316 21.9875 17.5088L21.875 17.4987V17.4963ZM10.5775 18.4775C11.3984 19.5225 12.5632 20.2427 13.865 20.51C13.7582 21.1331 13.725 21.7666 13.7662 22.3975C11.9217 22.0927 10.2582 21.108 9.10375 19.6375C9.02758 19.5407 8.97122 19.4299 8.93788 19.3114C8.90454 19.1928 8.89488 19.0689 8.90945 18.9466C8.92402 18.8243 8.96253 18.7061 9.02278 18.5987C9.08304 18.4913 9.16385 18.3968 9.26062 18.3206C9.35739 18.2445 9.46821 18.1881 9.58676 18.1548C9.70531 18.1214 9.82927 18.1118 9.95155 18.1263C10.0738 18.1409 10.192 18.1794 10.2994 18.2397C10.4069 18.2999 10.5013 18.3807 10.5775 18.4775V18.4775ZM11.25 10.9375C11.4588 10.9316 11.6667 10.9676 11.8614 11.0435C12.056 11.1193 12.2335 11.2334 12.3833 11.379C12.5331 11.5246 12.6522 11.6988 12.7335 11.8912C12.8148 12.0837 12.8567 12.2905 12.8567 12.4994C12.8567 12.7083 12.8148 12.9151 12.7335 13.1075C12.6522 13.2999 12.5331 13.4741 12.3833 13.6197C12.2335 13.7654 12.056 13.8795 11.8614 13.9553C11.6667 14.0311 11.4588 14.0672 11.25 14.0612C10.8434 14.0497 10.4573 13.8801 10.1738 13.5885C9.8903 13.2968 9.73169 12.9061 9.73169 12.4994C9.73169 12.0926 9.8903 11.7019 10.1738 11.4103C10.4573 11.1186 10.8434 10.949 11.25 10.9375ZM18.75 10.9375C18.9588 10.9316 19.1667 10.9676 19.3614 11.0435C19.556 11.1193 19.7335 11.2334 19.8833 11.379C20.0331 11.5246 20.1522 11.6988 20.2335 11.8912C20.3148 12.0837 20.3567 12.2905 20.3567 12.4994C20.3567 12.7083 20.3148 12.9151 20.2335 13.1075C20.1522 13.2999 20.0331 13.4741 19.8833 13.6197C19.7335 13.7654 19.556 13.8795 19.3614 13.9553C19.1667 14.0311 18.9588 14.0672 18.75 14.0612C18.3434 14.0497 17.9573 13.8801 17.6738 13.5885C17.3903 13.2968 17.2317 12.9061 17.2317 12.4994C17.2317 12.0926 17.3903 11.7019 17.6738 11.4103C17.9573 11.1186 18.3434 10.949 18.75 10.9375V10.9375Z"
        fill="#BFBFBF"
      />
    </svg>
  );
}

export default AddEmojiIcon;
