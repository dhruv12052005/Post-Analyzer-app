from setuptools import setup, find_packages

setup(
    name="ml-service",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.104.1",
        "uvicorn>=0.24.0",
        "textblob>=0.17.1",
        "numpy>=1.24.0,<2.0.0",
        "pandas>=1.5.0,<3.0.0",
        "scikit-learn>=1.3.0,<2.0.0",
        "python-multipart>=0.0.6",
        "pydantic>=2.4.2",
    ],
    python_requires=">=3.8",
) 