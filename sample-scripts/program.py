import time
import random
import argparse
import signal
import sys
import os
import logging
from datetime import datetime

class SMSSimulator:
    def __init__(self, country: str, operator: str):
        self.country = country
        self.operator = operator
        self.total_attempts = 0
        self.successful_attempts = 0
        self.failed_attempts = 0
        self.running = True

        # Create logs directory if it doesn't exist
        os.makedirs('logs', exist_ok=True)

        # Get the script filename without .py extension
        script_filename = os.path.splitext(os.path.basename(sys.argv[0]))[0]

        # Get current timestamp for log filename
        current_time = datetime.now().strftime('%Y%m%d_%H%M%S')

        # Setup logging with dynamic filename including timestamp
        log_filename = f"logs/{script_filename}.{country}_{operator}.{current_time}.log"
        self.logger = logging.getLogger(f"{country}_{operator}")
        self.logger.setLevel(logging.INFO)

        # Create file handler
        file_handler = logging.FileHandler(log_filename)
        file_handler.setLevel(logging.INFO)

        # Formatter to include timestamps
        formatter = logging.Formatter('%(asctime)s - %(message)s')
        file_handler.setFormatter(formatter)

        # Add handler to logger
        self.logger.addHandler(file_handler)

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.handle_shutdown)
        signal.signal(signal.SIGTERM, self.handle_shutdown)

        self.logger.info(f"Starting SMS Simulator for {country} - {operator}")

    def get_current_time(self):
        """Return the current time formatted as a timestamp."""
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

    def handle_shutdown(self, signum, frame):
        """Handle graceful shutdown"""
        self.running = False
        success_rate = self.get_success_rate()
        shutdown_message = f"Shutting down. Total Attempts: {self.total_attempts}, Successful: {self.successful_attempts}, Failed: {self.failed_attempts}, Final Success Rate: {success_rate:.2f}%"
        print(f"\n{shutdown_message}")
        self.logger.info(shutdown_message)
        sys.exit(0)

    def get_success_rate(self) -> float:
        """Calculate simple success rate"""
        if self.total_attempts == 0:
            return 0.0
        return (self.successful_attempts / self.total_attempts) * 100

    def simulate_sms(self):
        """Simulate single SMS with realistic timing"""
        # Simulate various real-world scenarios with different timings
        scenario = random.random()

        if scenario < 0.2:  # 20% chance of quick delivery
            delay = random.uniform(0.5, 2.0)
        elif scenario < 0.6:  # 40% chance of normal delivery
            delay = random.uniform(2.0, 5.0)
        elif scenario < 0.9:  # 30% chance of slow delivery
            delay = random.uniform(5.0, 10.0)
        else:  # 10% chance of very slow delivery or timeout
            delay = random.uniform(10.0, 15.0)

        time.sleep(delay)

        # Update counters and determine success
        self.total_attempts += 1
        success = random.random() < 0.75  # 75% base success rate with some randomness

        # Log each SMS attempt with timestamp, success/failure, delay, and success rate
        timestamp = self.get_current_time()
        if success:
            self.successful_attempts += 1
            self.logger.info(f"{timestamp} - SMS attempt #{self.total_attempts} - Success: True, Delay: {delay:.2f}s, Success Rate: {self.get_success_rate():.2f}%")
        else:
            self.failed_attempts += 1
            self.logger.info(f"{timestamp} - SMS attempt #{self.total_attempts} - Success: False, Delay: {delay:.2f}s, Success Rate: {self.get_success_rate():.2f}%")

        # Print the current success rate to the console
        print(f"Success Rate: {self.get_success_rate():.2f}%")

def run_simulator():
    """Setup and run the simulator"""
    parser = argparse.ArgumentParser(description='SMS Simulator')
    parser.add_argument('--country', required=True, help='Country name')
    parser.add_argument('--operator', required=True, help='Operator name')

    args = parser.parse_args()
    simulator = SMSSimulator(args.country, args.operator)

    print(f"Starting SMS Simulator for {args.country} - {args.operator}")
    print("Use Ctrl+C to stop the simulation\n")

    try:
        while simulator.running:
            simulator.simulate_sms()
            # Add random interval between SMS attempts
            time.sleep(random.uniform(3.0, 8.0))
    except KeyboardInterrupt:
        simulator.handle_shutdown(None, None)

if __name__ == "__main__":
    run_simulator()
