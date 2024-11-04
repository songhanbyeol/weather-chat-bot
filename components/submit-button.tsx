interface SubmitButtonProps {
    isLoading: boolean;
    isDisabled: boolean;
    onStop: () => void;
  }
  
  function SubmitButton({ isLoading, isDisabled, onStop }: SubmitButtonProps) {
    return (
      <button
        className={`px-1 text-sm text-white ${isLoading ? 'bg-red-500' : 'bg-blue-500'} rounded-r-lg`}
        onClick={isLoading ? onStop : undefined}
        type="submit"
        disabled={isDisabled}
      >
        {isLoading ? '중지' : '전송'}
      </button>
    );
  }
  
  export default SubmitButton;
  